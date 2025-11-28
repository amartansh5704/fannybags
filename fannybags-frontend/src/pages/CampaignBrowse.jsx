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

  const applyFilters = useCallback(
    (allCampaigns, filters, searchText) => {
      let filtered = [...allCampaigns];

      if (searchText.trim() !== "") {
        const term = searchText.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title?.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term)
        );
      }

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

  useEffect(() => {
    const updated = applyFilters(campaigns, activeFilters, search);
    setFilteredCampaigns(updated);
  }, [campaigns, activeFilters, search, applyFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        setCampaigns(data);
        setFilteredCampaigns(data);
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
      <div className="grid grid-cols-[20%_80%] min-h-screen bg-[#0A0A0A] text-white">
        <div></div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF48B9] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="grid grid-cols-[20%_80%] min-h-screen bg-[#0A0A0A] text-white">
        <div></div>
        <div className="flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-[20%_80%] min-h-screen bg-[#0A0A0A] text-white">

      {/* Left 20% (empty space) */}
      <div></div>

      {/* Right 80% (canvas) */}
      <div className="py-8 px-10">

        {/* Search Bar */}
        <div className="w-full flex justify-center pb-6">
          <div style={{ width: "100%", maxWidth: "450px" }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search campaigns..."
            />
          </div>
        </div>

        {/* Filters + Grid */}
        <div className="w-full max-w-7xl mx-auto">
          <FilterPanel onFiltersChange={setActiveFilters} />

          <div className="mb-6 text-gray-400 text-sm">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg">No campaigns found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <AnimatedList
              staggerDelay={0.1}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </AnimatedList>
          )}
        </div>
      </div>
    </div>
  );
}
