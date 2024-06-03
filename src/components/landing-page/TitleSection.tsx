import React from "react";

interface TitleSectionProps {
  title: string;
  subHeading?: string;
  pill: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({
  title,
  subHeading,
  pill,
}) => {
  return (
    <>
      <section className="flex flex-col gap4 justify-center items-start md:items-center ">
        <article
          className="rounded-full p-[1px] text-sm dark:bg-gradient-to-r 
        dark:from-brand-primaryBlue
        dark:to-brand-primaryPurple"
        >
          <div className="rounded-full px-3 py-1 dark:bg-black">{pill}</div>
        </article>
        {subHeading ? (
          <>
            <h2
              className="text-left text-3xl sm:text-5xl sm:max-w-[750px]
            sm:text-center font-semibold"
            >
              {title}
            </h2>
            <p className="dark:text-washed-purple-700 sm:max-w-[450px] md:text-center">
              {subHeading}
            </p>
          </>
        ) : (
          <h1 className="text-left text-4xl sm:text-6xl md:text-center font-semibold ">
            {title}
          </h1>
        )}
      </section>
    </>
  );
};

export default TitleSection;
