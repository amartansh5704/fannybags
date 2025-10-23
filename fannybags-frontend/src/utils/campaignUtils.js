// Function to determine campaign status
export const getCampaignStatus = (campaign) => {
  const today = new Date();
  
  // Handle null dates gracefully
  const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
  const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
  
  const amountRaised = campaign.amount_raised || 0;
  const targetAmount = campaign.target_amount || 1; // Avoid division by zero
  const percentage = (amountRaised / targetAmount) * 100;

  // If campaign has ended
  if (endDate && today > endDate) {
    return percentage >= 100 ? 'successful' : 'failed';
  }
  
  // If campaign hasn't started
  if (startDate && today < startDate) {
    return 'upcoming';
  }
  
  // Campaign is currently active
  return 'active';
};

// You can add other shared campaign helper functions here in the future