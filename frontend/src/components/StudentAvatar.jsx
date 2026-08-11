import { Avatar } from "./Avatar";

export function StudentAvatar({ nom, prenom }) {
  return <Avatar name={`${prenom} ${nom}`} />;
}
