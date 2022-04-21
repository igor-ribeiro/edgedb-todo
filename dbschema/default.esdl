module default {
  type Task {
    required property title -> str;
    property done -> bool {
      default := false;
    }
    required link user -> User;
  }

  type User {
    required property name -> str {
      constraint exclusive;
    }
  }
}
