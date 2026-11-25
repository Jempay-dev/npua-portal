import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "./Icons.jsx";

export default function BackToSignIn() {
  return (
    <Link to="/login" className="back-link">
      <ArrowLeftIcon />
      Վերադառնալ մուտքի էջ
    </Link>
  );
}
