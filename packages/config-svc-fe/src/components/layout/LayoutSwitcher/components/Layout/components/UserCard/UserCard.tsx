import React from "react";

import { Icon } from "~/components/common/Icon";

interface UserCardProps {
  name: string;
  accountRole: string;
  image: string;
}

export const UserCard = ({ name, accountRole, image }: UserCardProps) => (
  <div className="flex items-center p-4 ">
    <img className="w-12 h-12 rounded-full mr-4" src={image} alt={`${name}'s avatar`} />
    <div>
      <h2 className="text-md">{name}</h2>
      <p className="text-sm text-gray-600">{accountRole}</p>
    </div>
    <Icon
      name="notification"
      width="40px"
      height="40px"
      className="ml-3 bg-gray-100 p-1 rounded-full"
    />
  </div>
);
