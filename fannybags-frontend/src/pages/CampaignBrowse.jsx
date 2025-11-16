import { useEffect, useState, useCallback } from "react";
import { campaignService } from "../services/campaignService";
import FilterPanel from "../components/common/FilterPanel";
import CampaignCard from "../components/campaigns/CampaignCard";
import AnimatedList from "../components/reactbits/components/AnimatedList";
import SearchBar from "../components/common/SearchBar";

export default function CampaignBrowse() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    genre: "",
    priceRange: "all",
    sort: "newest",
  });

  // --------------------------
  // 🧠 FILTER LOGIC (memoized)
  // --------------------------
  const applyFilters = useCallback(
    (allCampaigns, filters, searchText) => {
      let filtered = [...allCampaigns];

      // 🔍 Search filter
      if (searchText.trim() !== "") {
        const term = searchText.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title?.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term)
        );
      }

      // 💰 Price range filter
      if (filters.priceRange !== "all") {
        filtered = filtered.filter((c) => {
          const price = c.partition_price || 0;
          switch (filters.priceRange) {
            case "1k-10k":
              return price >= 1000 && price <= 10000;
            case "10k-50k":
              return price >= 10000 && price <= 50000;
            case "50k+":
              return price >= 50000;
            default:
              return true;
          }
        });
      }

      // 🔽 Sort filter
      switch (filters.sort) {
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          break;
        case "most_funded":
          filtered.sort((a, b) => (b.amount_raised || 0) - (a.amount_raised || 0));
          break;
        case "ending_soon":
          filtered.sort(
            (a, b) => new Date(a.end_date) - new Date(b.end_date)
          );
          break;
        case "lowest_price":
          filtered.sort(
            (a, b) => (a.partition_price || 0) - (b.partition_price || 0)
          );
          break;
        case "highest_price":
          filtered.sort(
            (a, b) => (b.partition_price || 0) - (a.partition_price || 0)
          );
          break;
        default:
          break;
      }

      return filtered;
    },
    []
  );

  // ------------------------------------------------
  // 📌 Re-filter campaigns whenever ANY filter changes
  // ------------------------------------------------
  useEffect(() => {
    const updated = applyFilters(campaigns, activeFilters, search);
    setFilteredCampaigns(updated);
  }, [campaigns, activeFilters, search, applyFilters]);

  // -------------------------
  // 📦 Fetch campaigns once
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        setCampaigns(data);
        setFilteredCampaigns(data); // initial load
      } catch {
        setError("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        Loading campaigns...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-32">

      {/* 🔥 CENTERED SEARCH BAR */}
      <div className="w-full flex justify-center" style={{ marginTop: "80px" }}>
        <div style={{ width: "100%", maxWidth: "350px" }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search campaigns..."
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-10">
        
        <FilterPanel onFiltersChange={setActiveFilters} />

        <div className="mb-6 text-gray-400">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>

        <AnimatedList
          staggerDelay={0.1}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
