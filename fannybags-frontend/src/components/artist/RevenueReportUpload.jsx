import { useState } from "react";
import { showToast } from "../../utils/animations";
import { campaignService } from "../../services/campaignService";

export default function RevenueReportUpload({ campaignId, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];

    if (!validTypes.includes(file.type)) {
      showToast.error("Only PDF, Excel or CSV allowed");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);

    try {
      setUploading(true);

      // FIX: Correct function call
      await campaignService.uploadMonthlyRevenueReport(campaignId, formData);

      showToast.success("Report uploaded successfully!");
      if (onUpload) onUpload();
    } catch (err) {
      console.error(err);
      showToast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-gray-300 font-medium">Upload Monthly Report</label>

      <input
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={handleFileUpload}
        disabled={uploading}
        className="p-3 bg-black/40 border border-gray-600 rounded-xl text-white"
      />

      {uploading && (
        <p className="text-sm text-gray-400">Uploading...</p>
      )}
    </div>
  );
}
