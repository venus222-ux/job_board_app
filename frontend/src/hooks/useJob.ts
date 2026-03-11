import { useEffect, useRef, useState } from "react";
import { jobService } from "../services/jobService";
import { toast } from "react-toastify";
import { Job } from "../types/job";

export const useJob = (slug?: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<File | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slug) return;

    jobService
      .getJobBySlug(slug)
      .then((res) => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!job) return;
    jobService.recordView(job.id);
  }, [job]);

  useEffect(() => {
    if (!job) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    jobService
      .getMyApplications()
      .then((res) => {
        const ids = res.data.map((a: any) => a.job.id);
        if (ids.includes(job.id)) setApplied(true);
      })
      .catch(() => {});
  }, [job]);

  //clear the interval when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startApply = () => {
    if (!resume) return toast.error("Upload resume");
    if (applied) return toast.info("Already applied");

    setCountdown(3);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          submit();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  const submit = async () => {
    if (!job || !resume) return;

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      await jobService.apply(job.slug, formData);
      setApplied(true);
      toast.success("Applied 🎉");
    } catch {
      toast.error("Failed");
    }
  };

  return {
    job,
    loading,
    resume,
    setResume,
    startApply,
    countdown,
    applied,
  };
};
