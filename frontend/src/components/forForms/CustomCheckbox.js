// components/CustomCheckbox.jsx
import styles from './CustomCheckbox.module.css';

const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        className={styles.hiddenCheckbox}
        checked={checked}
        onChange={onChange}
      />
      <span className={`${styles.checkmark} ${checked ? styles.checked : ''}`}></span>
      {label}
    </label>
  );
};

export default CustomCheckbox;
