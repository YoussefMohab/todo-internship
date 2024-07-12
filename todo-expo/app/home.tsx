import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Link, useRouter } from "expo-router";
import axiosInstance from "../axiosConfig";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  password: string;
  todos: Todo[];
}

const HomeScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    retrieveToken();
  }, []);

  const retrieveToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("userToken");

      setToken(storedToken);

      if (!storedToken) {
        router.replace("/login");
        return null;
      }

      fetchTodos(storedToken);
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      setToken(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchTodos = async (storedToken: String | null) => {
    try {
      const response = await axiosInstance.get("/todos", {
        headers: {
          Authorization: `Bearer ${token || storedToken}`,
        },
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    try {
      const response = await axiosInstance.post(
        "/todos",
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos([...todos, response.data]);
      setTitle("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTodo = async (id: string, completed: boolean) => {
    try {
      const response = await axiosInstance.put(
        `/todos/${id}`,
        { completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axiosInstance.delete(`/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="New Todo"
      />
      <Button title="Add Todo" onPress={addTodo} />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todo}>
            <Text style={item.completed ? styles.completed : undefined}>
              {item.title}
            </Text>
            <Button
              title="Toggle"
              onPress={() => updateTodo(item.id, !item.completed)}
            />
            <Button title="Delete" onPress={() => deleteTodo(item.id)} />
          </View>
        )}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  todo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  completed: {
    textDecorationLine: "line-through",
  },
});

export default HomeScreen;
