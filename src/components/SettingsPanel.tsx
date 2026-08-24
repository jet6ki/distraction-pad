/**
 * SETTINGS
 * ========
 * Deliberately sparse for now — the Figma shows a title and a destructive
 * action, nothing else. Background and font pickers are planned but not built,
 * so rather than invent controls that do nothing, the section is left empty and
 * marked.
 */

export default function SettingsPanel({ onDelete }: { onDelete?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-9">
      <h2 className="settings-title">Settings</h2>

      <div className="flex-1" />

      <button className="settings-danger" onClick={onDelete}>
        Delete account?
      </button>
    </div>
  )
}
