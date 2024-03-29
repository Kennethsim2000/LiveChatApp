import React from "react";
import Connection from "../images/Connection.png";
import { RiAdminFill } from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

const Box = ({
  handleOpenSupportWidget,
}: {
  handleOpenSupportWidget: () => void;
}) => {
  return (
    <div className="absolute top-20 left-0 max-w-sm px-4 md:top-32 md:left-20">
      <h1 className="text-lg font-bold text-gray-500">Start a live chat</h1>
      <h1 className="text-lg font-bold text-gray-500">
        Please proceed to admin page on another tab first before clicking on
        connect
      </h1>
      <div className="mt-2 flex border border-blue-200 bg-gray-100 p-6 hover:cursor-pointer hover:bg-blue-100">
        <Image src={Connection} width={30} height={30} alt="connection" />
        <div onClick={handleOpenSupportWidget} className="ml-3 flex flex-col">
          <h2 className="text-lg font-bold text-gray-700">Lets connect!</h2>
          <h3 className="text-md  text-gray-900">
            Connect with one of our admins
          </h3>
        </div>
      </div>

      <h1 className="mt-6 text-lg font-bold text-gray-500">
        Proceed to admin page
      </h1>
      <a target="_blank" href="/admin" rel="noopener noreferrer">
        <div className="mt-2 flex items-center border border-blue-200 bg-gray-100 p-6 hover:cursor-pointer hover:bg-blue-100">
          <RiAdminFill className="h-10 w-10 text-gray-500" />
          <div className="ml-3 flex flex-col">
            <h2 className="text-lg font-bold text-gray-700">Be the admin!</h2>
            <h3 className="text-md  whitespace-normal text-gray-900">
              Communicate with multiple clients
            </h3>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Box;
