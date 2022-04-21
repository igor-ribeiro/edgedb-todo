CREATE MIGRATION m1vxivrzyf7e4db2xdpmzyhxis46lpjl6oioy6egzirzxperdfgvkq
    ONTO initial
{
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY name -> std::str;
  };
  CREATE TYPE default::Task {
      CREATE LINK user -> default::User;
      CREATE PROPERTY done -> std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY title -> std::str;
  };
};
