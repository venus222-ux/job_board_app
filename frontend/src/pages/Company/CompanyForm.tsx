import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import API from "../../api";
import { toast } from "react-toastify";
import { useCompanyStore, Company } from "../../store/companyStore";

interface Props {
  onClose?: () => void;
}

const CompanyForm = ({ onClose }: Props) => {
  const { company, setCompany, setCompanies, companies } = useCompanyStore();

  const [name, setName] = useState(company?.name || "");
  const [description, setDescription] = useState(company?.description || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    company?.logo ? `http://localhost:8000/storage/${company.logo}` : null,
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (files) => {
      setLogoFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    },
  });

  // Reset form when company changes
  useEffect(() => {
    if (company) {
      setName(company.name);
      setDescription(company.description || "");
      setWebsite(company.website || "");
      setPreview(
        company.logo ? `http://localhost:8000/storage/${company.logo}` : null,
      );
      setLogoFile(null);
    } else {
      setName("");
      setDescription("");
      setWebsite("");
      setPreview(null);
      setLogoFile(null);
    }
  }, [company]);

  const submit = async () => {
    if (!name.trim()) return toast.error("Name is required");

    const form = new FormData();
    form.append("name", name.trim());
    form.append("description", description ? description.trim() : "");

    // ✅ Prepend https:// if missing
    if (website.trim()) {
      let finalWebsite = website.trim();
      if (!/^https?:\/\//i.test(finalWebsite)) {
        finalWebsite = `https://${finalWebsite}`;
      }
      form.append("website", finalWebsite);
    }

    if (logoFile) form.append("logo", logoFile, logoFile.name);

    try {
      let res;
      if (company) {
        // UPDATE
        form.append("_method", "PUT"); // Laravel uses _method for PUT
        res = await API.post(`/employer/companies/${company.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Update state
        setCompanies(
          companies.map((c) => (c.id === res.data.id ? res.data : c)),
        );
        setCompany(res.data);
        toast.success("Company updated");
      } else {
        // CREATE
        res = await API.post("/employer/companies", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setCompanies([res.data, ...companies]);
        setCompany(res.data);
        toast.success("Company created");
      }

      onClose?.();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        messages.forEach((msg: string) => toast.error(msg));
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Save failed");
      }
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h4>{company ? "Edit Company" : "Create Company"}</h4>

      <input
        className="form-control mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <textarea
        className="form-control mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        className="form-control mb-2"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website (optional)"
      />

      <div {...getRootProps()} className="border p-4 text-center mb-3">
        <input {...getInputProps()} />
        {isDragActive ? "Drop logo here" : "Drag & drop logo or click"}
      </div>

      {preview && <img src={preview} width={120} className="mb-2" />}

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={submit}>
          Save
        </button>
        {onClose && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              setCompany(null);
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyForm;
