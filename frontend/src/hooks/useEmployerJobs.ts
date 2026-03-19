import { useEffect, useState } from "react";
import { jobService } from "../services/jobService";

export const useEmployerJobs = (companyId: number) => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    jobService.getEmployerJobs(companyId).then((res) => setJobs(res.data));
  }, [companyId]);

  const changeStatus = async (id: number, status: string) => {
    const res = await jobService.changeStatus(id, status);
    setJobs((prev) => prev.map((j) => (j.id === id ? res.data : j)));
  };

  return { jobs, changeStatus };
};
