// import * as shiki from "shiki";
import { common, webpack } from "replugged";
const {
  React,
  i18n: { intl, t },
  hljs,
} = common;
import langs from "./langs.json";

const mod = await webpack.waitForModule<Record<string, unknown>>(
  webpack.filters.bySource(
    'document.queryCommandEnabled("copy")||document.queryCommandSupported("copy")',
  ),
);
const Clipboard = {
  copy: Object.values(mod).find((e) => typeof e === "function") as (
    content: string,
  ) => boolean | void,
  SUPPORTED: Object.values(mod).find((e) => typeof e === "boolean") as boolean,
};

function resolveLang(id: string) {
  return langs.find((lang) => [...(lang.aliases || []), lang.id].includes(id));
}

export default function (props: { lang: string; code: string }): React.ReactElement {
  const { lang, code } = props;

  let lines;
  let langName = resolveLang(lang);
  if (langName) {
    const res = hljs.highlight(code, { language: lang.toLowerCase() });
    lines = res.value
      .split("\n")
      .map((line) => <span dangerouslySetInnerHTML={{ __html: line }} />);
  } else {
    lines = code.split("\n").map((line) => <span>{line}</span>);
  }

  const rows = lines.map((line, i) => (
    <tr>
      <td style={{ color: "var(--text-normal)" }}>{i + 1}</td>
      <td>{line}</td>
    </tr>
  ));

  const [copyCooldown, setCopyCooldown] = React.useState(false);

  function onCopyBtnClick() {
    if (copyCooldown) {
      return;
    }
    setCopyCooldown(true);
    setTimeout(() => setCopyCooldown(false), 1000);
    Clipboard.copy(code);
  }

  return (
    <pre className="better-codeblocks">
      <code className="hljs">
        {langName && (
          <div className="better-codeblocks-lang">
            {langName.devicon && <i className={`devicon-${langName.devicon}`} />}
            {langName.name}
          </div>
        )}
        <table className="better-codeblocks-table">{rows}</table>
        {Clipboard.SUPPORTED && (
          <div className="better-codeblocks-btns">
            <button
              className="better-codeblocks-btn"
              onClick={onCopyBtnClick}
              style={{
                backgroundColor: copyCooldown ? "#36a84d" : "#7289da",
                color: "#FFF",
                cursor: copyCooldown ? "default" : "",
              }}>
              {copyCooldown ? intl.string(t.COPY_SUCCESS_1) : intl.string(t.COPY)}
            </button>
          </div>
        )}
      </code>
    </pre>
  );
}
