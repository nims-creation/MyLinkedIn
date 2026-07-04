"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Building, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) return alert("Please login to apply");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid })
      });
      
      if (res.ok) {
        alert("Applied successfully!");
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to apply");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading jobs...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recommended for you</h1>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No jobs posted yet</h2>
            <p className="text-gray-500">Check back later for new opportunities.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const hasApplied = user && job.applicants.includes(user.uid);
            return (
              <div key={job._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{job.title}</h2>
                    <div className="flex items-center text-gray-700 dark:text-gray-300 mt-1 mb-3">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="mr-4 font-medium">{job.company}</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {job.type}
                      </span>
                      {job.salary !== "Not disclosed" && (
                        <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" /> {job.salary}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{job.description}</p>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      {job.applicants.length} {job.applicants.length === 1 ? 'applicant' : 'applicants'}
                    </div>
                  </div>
                  
                  <div>
                    {hasApplied ? (
                      <Button variant="outline" disabled className="w-24">Applied</Button>
                    ) : (
                      <Button onClick={() => handleApply(job._id)} className="w-24">Apply</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
