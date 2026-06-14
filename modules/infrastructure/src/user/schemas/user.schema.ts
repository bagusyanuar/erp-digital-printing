export interface RoleResponse {
  id: string;
  name: string;
}

export interface UserResponse {
  id: string;
  username: string;
  roles?: RoleResponse[];
}
