import { THEMES_DATA } from "@/constants/themes";
import { useThemeContext } from "@/hooks/useThemes";

export function Themes() {
  const { updateTheme } = useThemeContext();
  return (
    <div className="flex-1 bg-bgAuxiliary1 py-12 px-10">
      <div className="grid grid-cols-1 gap-8">
        {
          THEMES_DATA.map(theme => {
            return (
              <div
                key={theme.id}
                className="p-4 flex items-start justify-between cursor-pointer"
                style={{ backgroundColor: theme.boardBg }}
                onClick={() => {
                  updateTheme(theme.name);
                }}
              >
                <div>
                  <h2 className="text-lg capitalize">{theme.name}</h2>
                </div>
                <div className="grid grid-cols-2">
                  <img
                    src="/bk.png"
                    className="w-16 h-16"
                    alt="chess-piece"
                    style={{ backgroundColor: theme.darkSquare }}
                  />
                  <img
                    src="/wn.png"
                    className="w-16 h-16"
                    alt="chess-piece"
                    style={{ backgroundColor: theme.lightSquare }}
                  />
                  <img
                    src="/br.png"
                    className="w-16 h-16"
                    alt="chess-piece"
                    style={{ backgroundColor: theme.lightSquare }}
                  />
                  <img
                    src="/wp.png"
                    className="w-16 h-16"
                    alt="chess-piece"
                    style={{ backgroundColor: theme.darkSquare }}
                  />
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}