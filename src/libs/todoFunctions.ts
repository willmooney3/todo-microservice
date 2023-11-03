import { v4 as uuidv4 } from "uuid";
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemOutput,
  PutItemCommand,
  PutItemCommandInput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

let dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint:
    process.env.DDB_ENDPOINT !== "" ? process.env.DDB_ENDPOINT : undefined,
});

/**
 * Get all the todos.
 *
 * @returns a `ToDoListResult` which contains all todos in an `items` list
 */
function getAllTodos({}: {}): { todos: ToDo[] } {
  // Note: I would never normally use a scan, but this is a simple demo app
  let parameters: ScanCommandInput = {
    TableName: process.env.TABLE_NAME,
  };
  let command: ScanCommand = new ScanCommand(parameters);
  let result: Promise<ScanCommandOutput> = dynamodbClient.send(command);
  var response = {};
  result
    .then((result: ScanCommandOutput) => {
      response = {
        items: result.Items,
      };
    })
    .catch((error) => {
      response = {
        items: [],
      };
    });
  return {
    todos: [],
  };
}

/**
 * Get a specific todo's details.
 *
 * @param todoId The ID of the todo to get details for
 * @returns The {@link ToDo} with the matching ID
 */
function getTodo({ todoId }: { todoId: string }): { todo: ToDo | null } {
  let parameters: GetItemCommandInput = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `TODO#${todoId}` },
    },
  };
  let command: GetItemCommand = new GetItemCommand(parameters);
  let result: Promise<GetItemOutput> = dynamodbClient.send(command);
  result.then((result: GetItemOutput) => {}).catch((error) => {});
  return {
    todo: null,
  };
}

/**
 * Get a specific todo's details.
 *
 * @param todoData The ID of the todo to get details for
 * @returns The {@link ToDo} that was created
 */
async function createTodo({
  todoData,
}: {
  todoData: ToDo;
}): Promise<{ todo: ToDo | null }> {
  const uuid = uuidv4(); // Generate a UUID here
  const dbParameters: PutItemCommandInput = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `TODO#${uuid}` },
      Name: { S: todoData.description },
      CreatedAt: { N: String(new Date().getTime()) },
      Complete: { BOOL: false },
    },
  };
  const command = new PutItemCommand(dbParameters);

  try {
    await dynamodbClient.send(command);
    return {
      todo: {
        ...todoData,
        id: uuid,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      todo: null,
    };
  }
}

/**
 * Update the todo with the given ID with the given data.
 *
 * @param todoId The ID of the todo to update
 * @param todoData The data to update the todo with
 * @returns The {@link ToDo} that was updated
 */
async function updateTodo({
  todoId,
  todoData,
}: {
  todoId: string;
  todoData: ToDo;
}): Promise<{ todo: ToDo | null }> {
  const parameters: UpdateItemCommandInput = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `TODO#${todoId}` },
    },
    AttributeUpdates: {
      description: {
        Value: { S: todoData.description },
        Action: "PUT",
      },
      completed: {
        Value: { BOOL: todoData.complete },
        Action: "PUT",
      },
    },
  };
  const command: UpdateItemCommand = new UpdateItemCommand(parameters);

  try {
    await dynamodbClient.send(command);
    return {
      todo: todoData,
    };
  } catch (error) {
    console.error(error);
    return {
      todo: null,
    };
  }
}

/**
 * Delete the todo with the given ID.
 *
 * @param todoId The ID of the todo to delete
 * @returns The {@link ToDo} that was deleted
 */
async function deleteTodo({
  todoId,
}: {
  todoId: string;
}): Promise<{ status: string }> {
  const parameters: DeleteItemCommandInput = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `TODO#${todoId}` },
    },
  };
  const deleteCommand: DeleteItemCommand = new DeleteItemCommand(parameters);

  try {
    await dynamodbClient.send(deleteCommand);
    return { status: "success" };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
    };
  }
}

export { createTodo, deleteTodo, getAllTodos, getTodo, updateTodo };
