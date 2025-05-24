import { useState } from "react";
import { DownOutlined, UpOutlined, SettingOutlined } from "@ant-design/icons";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl shadow-md bg-white ${className}`}>{children}</div>
);

const Button = ({ children, variant = "solid", className = "", ...props }) => {
  const baseStyle =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return (
    <button className={`px-4 py-2 rounded-md text-sm font-medium ${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

const dummyData = {
  rules: { total: 5, draft: 1, pendingReview: 1 },
  typologies: { total: 3, draft: 1, pendingReview: 1 },
  networkMaps: { total: 5, draft: 1, pendingReview: 1 },
  ruleConfigs: { total: 3, draft: 1, pendingReview: 1 },
};

const Dashboard = () => {
  const [expanded, setExpanded] = useState({
    rules: false,
    typologies: false,
    networkMaps: false,
    ruleConfigs: false,
  });

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCard = (title, key, color) => (
    <Card className={`p-4 w-full max-w-xs border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{dummyData[key].total}</p>
        </div>
        <button onClick={() => toggleExpand(key)}>
          {expanded[key] ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>
      {expanded[key] && (
        <div className="mt-3 text-sm">
          <p>Draft: {dummyData[key].draft}</p>
          <p>Pending Review: {dummyData[key].pendingReview}</p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <SettingOutlined /> Customize Dashboard
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderCard("Rules", "rules", "border-red-500")}
        {renderCard("Typologies", "typologies", "border-yellow-500")}
        {renderCard("Network Maps", "networkMaps", "border-green-500")}
        {renderCard("Rule Configurations", "ruleConfigs", "border-blue-500")}
      </div>
    </div>
  );
};

export default Dashboard;
