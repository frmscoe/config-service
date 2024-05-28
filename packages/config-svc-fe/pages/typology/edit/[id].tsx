import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const TypologyEdit = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>LexTego - Configuration Service</title>
      </Head>
      <h1>Edit Typology: {id}</h1>
    </>
  );
};

export default TypologyEdit;
