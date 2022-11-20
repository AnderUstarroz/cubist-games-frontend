import styles from "./Terms.module.scss";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { TermsPropsType } from "./types";

const Button = dynamic(() => import("../../button"));
const Icon = dynamic(() => import("../../icon"));

export default function Terms({
  display,
  terms,
  setTerms,
  setMainModal,
}: TermsPropsType) {
  return (
    <div className={styles.terms}>
      {display ? (
        <input
          type="checkbox"
          id="terms"
          checked={terms.agreed}
          onChange={() => setTerms({ ...terms, agreed: !terms.agreed })}
        />
      ) : (
        ""
      )}
      <div
        onClick={() =>
          setMainModal(
            <div className={styles.termsModal}>
              <h4>{terms.title}</h4>
              <ReactMarkdown>{terms.description as string}</ReactMarkdown>
              {display ? (
                <div className={styles.terms}>
                  <label>
                    <input
                      type="checkbox"
                      id="termsModal"
                      defaultChecked={terms.agreed}
                      onChange={() =>
                        setTerms({ ...terms, agreed: !terms.agreed })
                      }
                    />
                    I ACCEPT THESE TERMS &amp; CONDITIONS
                  </label>
                </div>
              ) : (
                ""
              )}
              <div>
                <Button onClick={() => setMainModal("", false)}>Close</Button>
              </div>
            </div>,
            true
          )
        }
      >
        <span className="subMsg">
          {`${display ? "I accept the " : ""}Terms & Conditions`}
        </span>{" "}
        <Icon cType="info" width={15} height={15} />
      </div>
    </div>
  );
}
