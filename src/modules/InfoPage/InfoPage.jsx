import { Link } from 'react-router-dom';
import IchgramIconLogin from '../../shared/icons/IchgramIconLogin/IchgramIconLogin';
import styles from './InfoPage.module.css';

const InfoPage = ({ children }) => {
  return (
    <div className={styles['info-page']}>
      <div className={styles['info-page__header']}>
        <Link to="/signup" className={styles['info-page__logo']}><IchgramIconLogin /></Link>
      </div>
      <div className={styles['info-page__body']}>
        {children}
      </div>
    </div>
  );
};

export default InfoPage;