export const initialStore = () => {
  return {
    message: null,
    isAuthenticated: !!sessionStorage.getItem("access_token"),
    userRole: sessionStorage.getItem("role") || null,
    user: JSON.parse(sessionStorage.getItem("user") || "null"),
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case "login":
      const { token, role, user } = action.payload;
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("user", JSON.stringify(user));
      return {
        ...store,
        isAuthenticated: true,
        userRole: role,
        user: user,
      };

    case "logout":
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return {
        ...store,
        isAuthenticated: false,
        userRole: null,
        user: null,
      };
    default:
      throw Error("Unknown action.");
  }
}
