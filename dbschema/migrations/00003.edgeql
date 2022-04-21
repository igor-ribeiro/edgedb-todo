CREATE MIGRATION m1hlzbymcvqwln6efuvy6dpnmaoaol76k7dp3f76bu4dy44wynhqgq
    ONTO m1f4jsso2xycu3btngit6art6wd5act4j6tuxym6cadun7uvvge7xq
{
  ALTER TYPE default::User {
      ALTER PROPERTY name {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
