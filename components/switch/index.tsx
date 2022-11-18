import styles from "./Switch.module.scss";
import { SwitchPropsType } from "./types";

export default function Switch({ onChange, value }: SwitchPropsType) {
  return (
    <div className={styles.switchDiv}>
      <div className={styles.flex}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => {
              onChange(!value);
            }}
          ></input>
          <span className={styles.slider + " " + styles.round}></span>
        </label>
      </div>
    </div>
  );
}
