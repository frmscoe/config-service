import classNames from "classnames";
import Link from "next/link";
import React from "react";

import { useCommonTranslations } from "~/hooks";

const AlreadyAMember = () => {
  const { t: commonTranslations } = useCommonTranslations();
  return (
    <div className={classNames("flex flex-col gap-4 items-center mt-8")}>
      <p className="text-gray text-sm">
        {commonTranslations("alreadyAMember")}{" "}
        <Link className="underline" href="/login">
          {commonTranslations("signIn")}
        </Link>
      </p>
      {/* Additional content can go here */}
    </div>
  );
};

export { AlreadyAMember };
