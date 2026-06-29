import { Router } from 'express';
import { db, GameStatus } from '@repo/db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        gamesAsWhite: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            result: true,
            startAt: true,
            endAt: true,
            blackPlayerId: true,
            blackPlayer: { select: { id: true, name: true } },
          },
        },
        gamesAsBlack: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            result: true,
            startAt: true,
            endAt: true,
            whitePlayerId: true,
            whitePlayer: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allGames = [
      ...user.gamesAsWhite.map((g) => ({
        id: g.id,
        opponentId: g.blackPlayerId,
        opponentName: g.blackPlayer.name,
        result: g.result,
        color: 'white',
        date: g.startAt,
      })),
      ...user.gamesAsBlack.map((g) => ({
        id: g.id,
        opponentId: g.whitePlayerId,
        opponentName: g.whitePlayer?.name ?? null,
        result: g.result,
        color: 'black',
        date: g.startAt,
      })),
    ];

    allGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = {
      totalGames: allGames.length,
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      currentStreakType: null as 'win' | 'loss' | null,
      bestWinStreak: 0,
    };

    for (const game of allGames) {
      if (game.result === 'DRAW') {
        stats.draws++;
        stats.currentStreak = 0;
        stats.currentStreakType = null;
        continue;
      }

      const won =
        (game.color === 'white' && game.result === 'WHITE_WINS') ||
        (game.color === 'black' && game.result === 'BLACK_WINS');

      if (won) {
        stats.wins++;
        stats.currentStreak += 1;
        stats.currentStreakType = 'win';
        if (stats.currentStreak > stats.bestWinStreak) {
          stats.bestWinStreak = stats.currentStreak;
        }
      } else {
        stats.losses++;
        stats.currentStreak = 0;
        stats.currentStreakType = null;
      }
    }

    const currentWinStreak = stats.currentStreakType === 'win' ? stats.currentStreak : 0;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        rating: user.rating,
        username: user.username,
        createdAt: user.createdAt,
      },
      stats,
      currentWinStreak,
      recentGames: allGames.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        rating: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gamesAsWhite = await db.game.findMany({
      where: { whitePlayerId: userId, status: GameStatus.COMPLETED },
      select: {
        id: true,
        result: true,
        startAt: true,
        endAt: true,
        blackPlayerId: true,
        blackPlayer: { select: { id: true, name: true } },
      },
    });

    const gamesAsBlack = await db.game.findMany({
      where: { blackPlayerId: userId, status: GameStatus.COMPLETED },
      select: {
        id: true,
        result: true,
        startAt: true,
        endAt: true,
        whitePlayerId: true,
        whitePlayer: { select: { id: true, name: true } },
      },
    });

    const allGames = [
      ...gamesAsWhite.map((g) => ({
        id: g.id,
        opponentId: g.blackPlayerId,
        opponentName: g.blackPlayer.name,
        result: g.result,
        color: 'white',
        date: g.startAt,
      })),
      ...gamesAsBlack.map((g) => ({
        id: g.id,
        opponentId: g.whitePlayerId,
        opponentName: g.whitePlayer?.name ?? null,
        result: g.result,
        color: 'black',
        date: g.startAt,
      })),
    ];

    allGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = {
      totalGames: allGames.length,
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      currentStreakType: null as 'win' | 'loss' | null,
      bestWinStreak: 0,
    };

    for (const game of allGames) {
      if (game.result === 'DRAW') {
        stats.draws++;
        stats.currentStreak = 0;
        stats.currentStreakType = null;
        continue;
      }

      const won =
        (game.color === 'white' && game.result === 'WHITE_WINS') ||
        (game.color === 'black' && game.result === 'BLACK_WINS');

      if (won) {
        stats.wins++;
        stats.currentStreak += 1;
        stats.currentStreakType = 'win';
        if (stats.currentStreak > stats.bestWinStreak) {
          stats.bestWinStreak = stats.currentStreak;
        }
      } else {
        stats.losses++;
        stats.currentStreak = 0;
        stats.currentStreakType = null;
      }
    }

    const currentWinStreak = stats.currentStreakType === 'win' ? stats.currentStreak : 0;

    res.json({
      user,
      stats,
      currentWinStreak,
      recentGames: allGames.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
