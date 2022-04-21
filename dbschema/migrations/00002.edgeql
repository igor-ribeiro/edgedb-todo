CREATE MIGRATION m1f4jsso2xycu3btngit6art6wd5act4j6tuxym6cadun7uvvge7xq
    ONTO m1vxivrzyf7e4db2xdpmzyhxis46lpjl6oioy6egzirzxperdfgvkq
{
  ALTER TYPE default::Task {
      ALTER LINK user {
          SET REQUIRED USING (SELECT
              default::User FILTER
                  (.name = 'Igor')
          LIMIT
              1
          );
      };
  };
};
