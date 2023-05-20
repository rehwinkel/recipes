import styles from './Loading.module.css';

const Loading = () => {
    return (
        <>
            <div class={styles["lds-ellipsis"]}><div></div><div></div><div></div><div></div></div>
        </>
    );
}

export default Loading;