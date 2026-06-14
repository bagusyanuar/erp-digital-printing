export interface RoleModel {
  id: string;
  name: string;
}

export interface UserModel {
  id: string;
  username: string;
  roles?: RoleModel[];
}
