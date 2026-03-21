import { useState, useEffect } from "react";
import API from "../api"; // axios instance
import { Job } from "../types/job";
import { toast } from "react-toastify";

export const useJob = (slug?: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [applied, setApplied] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Fetch job details
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    API.get(`/jobs/${slug}`)
      .then((res) => setJob(res.data))
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Submit application
  const startApply = async () => {
    if (!slug || !resume) return;

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      // Ensure your axios instance has Authorization header set
      const res = await API.post(`/jobs/${slug}/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Auth header is automatically added if using your configured axios
          // Otherwise: Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      setApplied(true);

      // Optional: start 3-sec countdown for undo
      let seconds = 3;
      setCountdown(`${seconds}s`);
      const timer = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds > 0 ? `${seconds}s` : null);
        if (seconds <= 0) clearInterval(timer);
      }, 1000);

      return res.data;
    } catch (err: any) {
      if (err.response?.status === 409) {
        setApplied(true);
        toast.info("You have already applied for this job.");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
      throw err;
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
    setApplied,
  };
};
