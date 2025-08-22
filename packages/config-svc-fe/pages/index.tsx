import { useState, useEffect } from "react";
import { DownOutlined, UpOutlined, SettingOutlined } from "@ant-design/icons";
// Import the new service function alongside the existing ones
import { fetchDashboardRules, fetchDashboardRuleConfigs, fetchDashboardTypologies, fetchDashboardNetworkMaps } from './service';
import { useRouter } from 'next/router';

// Define interfaces for data structure (no change to this part)
interface DashboardCardData {
  total: number;
  draft: number;
  pendingReview: number;
}

interface DashboardAllData {
  rules: DashboardCardData;
  typologies: DashboardCardData; // This interface is already defined and will now receive live data
  networkMaps: DashboardCardData;
  ruleConfigs: DashboardCardData;
}

// Simple Card component (no change)
const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl shadow-md bg-white ${className}`}>{children}</div>
);

// Simple Button component (no change)
const Button = ({ children, variant = "solid", className = "", ...props }) => {
  const baseStyle =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return (
    <button className={`px-4 py-2 rounded-md text-sm font-medium ${baseStyle} ${className}`} {...props}>
      {children}</button>
  );
};

const Dashboard = () => {
  // State for dashboard data, initialized with placeholder values
  // 'rules', 'ruleConfigs', and 'typologies' will now be populated by API calls
  const [dashboardData, setDashboardData] = useState<DashboardAllData>({
    rules: { total: 0, draft: 0, pendingReview: 0 },
    typologies: { total: 0, draft: 0, pendingReview: 0 }, // Initial zeros for typologies
    networkMaps: { total: 5, draft: 1, pendingReview: 1 }, // Retaining dummy data for networkMaps
    ruleConfigs: { total: 0, draft: 0, pendingReview: 0 },
  });

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  // State for individual card expansion (no change)
  const [expanded, setExpanded] = useState({
    rules: false,
    typologies: false,
    networkMaps: false,
    ruleConfigs: false,
  });

  // State: To control customizing mode (no change)
  // const [customizingMode, setCustomizingMode] = useState(false);
  // State: To control the order of cards (no change)
  // const [cardOrder, setCardOrder] = useState(['rules', 'typologies', 'networkMaps', 'ruleConfigs']);
  const cardOrder: (keyof DashboardAllData)[] = ['networkMaps', 'typologies', 'rules', 'ruleConfigs'];
  const routeMap: Record<keyof DashboardAllData, string> = {
    networkMaps: 'network-map',
    typologies: 'typology',
    rules: 'rule',
    ruleConfigs: 'rule-config',
  };


  // Fetch data on component mount
  useEffect(() => {
    const getDashboardData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      let hasError = false; // Flag to track if any fetch operation failed

      // Use Promise.allSettled to fetch all data concurrently and handle individual errors
      const [rulesResult, ruleConfigsResult, typologiesResult, networkMapsResult] = await Promise.allSettled([
        fetchDashboardRules(),
        fetchDashboardRuleConfigs(),
        fetchDashboardTypologies(), // Call the new fetch function
        fetchDashboardNetworkMaps(),
      ]);

      setDashboardData(prev => ({
        ...prev,
        rules: rulesResult.status === 'fulfilled' ? rulesResult.value : prev.rules,
        ruleConfigs: ruleConfigsResult.status === 'fulfilled' ? ruleConfigsResult.value : prev.ruleConfigs,
        typologies: typologiesResult.status === 'fulfilled' ? typologiesResult.value : prev.typologies,
        networkMaps: networkMapsResult.status === 'fulfilled' ? networkMapsResult.value : prev.networkMaps,
      }));


      // Check for any rejected promises to set a global error message
      if (rulesResult.status === 'rejected' || ruleConfigsResult.status === 'rejected' || typologiesResult.status === 'rejected' || networkMapsResult === 'rejected') {
        hasError = true;
      }

      setLoading(false);
      if (hasError) {
        setError("One or more dashboard data types failed to load. Please check console for details.");
      }
    };

    getDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // Function to toggle individual card expansion (no change)
  const toggleExpand = (key: keyof DashboardAllData) => {
    // console.log(`Clicked card key: ${key}`);
    setExpanded((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      // console.log(`Previous expanded state:`, prev);
      // console.log(`New expanded state for ${key}:`, newState);
      return newState;
    });
  };

  // Function to toggle customizing mode (no change)
  // const toggleCustomizingMode = () => {
  //   setCustomizingMode((prev) => !prev);
  // };

  // Helper function to shuffle an array (for demonstration of reordering) (no change)
  const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return [...array];
  };

  // Handler to shuffle cards when in customizing mode (no change)
  // const handleShuffleCards = () => {
  //   setCardOrder(shuffleArray(cardOrder));
  // };

  // Helper function to get card details (title and color) based on key (no change)
  const getCardDetails = (key: keyof DashboardAllData) => {
    switch (key) {
      case 'rules':
        return { title: 'Rules', color: 'border-red-500' };
      case 'typologies':
        return { title: 'Typologies', color: 'border-green-500' };
      case 'networkMaps':
        return { title: 'Network Maps', color: 'border-blue-500' };
      case 'ruleConfigs':
        return { title: 'Rule Configurations', color: 'border-purple-500' };
      default:
        return { title: '', color: '' };
    }
  };

  const renderCard = (title: string, key: keyof DashboardAllData, color: string) => (
    <div data-testid={`${key}-card`}>
      <Card className={`p-4 w-full max-w-xs border-l-4 ${color}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-2xl font-bold">{dashboardData[key].total}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent routing when toggling
              toggleExpand(key);
            }}
            data-testid={`${key}-expand-button`}
          >
            {expanded[key] ? <UpOutlined /> : <DownOutlined />}
          </button>
        </div>
        {expanded[key] && (
          <div className="mt-3 text-sm">
            <p
              className="cursor-pointer hover:underline"
              onClick={() => router.push(`/${routeMap[key]}`)} // Route to base path
            >
              Draft: {dashboardData[key].draft}
            </p>
            <p
              className="cursor-pointer hover:underline"
              onClick={() => router.push(`/${routeMap[key]}`)} // Route to base path
            >
              Pending Review: {dashboardData[key].pendingReview}
            </p>
          </div>
        )}
      </Card>
    </div>
  );


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/*<div className="flex items-center gap-2">
          {customizingMode && (
            <Button onClick={handleShuffleCards}>Shuffle Cards</Button>
          )}
          <Button variant="outline" className="flex items-center gap-2" onClick={toggleCustomizingMode}>
            <SettingOutlined /> {customizingMode ? 'Done Customizing' : 'Customize Dashboard'}
          </Button>
        </div>*/}
      </div>
      {loading && <p>Loading dashboard data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardOrder.map((key) => {
            const { title, color } = getCardDetails(key as keyof DashboardAllData);
            return <div key={key}>{renderCard(title, key as keyof DashboardAllData, color)}</div>;
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;