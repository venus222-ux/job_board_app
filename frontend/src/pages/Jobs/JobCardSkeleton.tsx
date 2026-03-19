// frontend/src/components/Job/JobCardSkeleton.tsx
import React from "react";
import styles from "./JobCardSkeleton.module.css";

const JobCardSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonTitle}></div>
      </div>
      <div className={styles.skeletonLine}></div>
      <div className={styles.skeletonLine}></div>
      <div className={styles.skeletonLineShort}></div>
      <div className={styles.skeletonFooter}>
        <div className={styles.skeletonBadge}></div>
        <div className={styles.skeletonBadge}></div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;
