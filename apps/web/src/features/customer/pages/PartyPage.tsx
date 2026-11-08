import { useParams } from "react-router-dom";

import CustomerSection from "../components/CustomerSection";
import PartyPage from "../../party/PartyPage";

export default function CustomerParty() {
  const { outletId } = useParams<{ outletId: string }>();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <CustomerSection
        title="Party Catering"
        description="Plan catering for your gathering, event, or celebration."
      >
        <PartyPage outletId={outletId} />
      </CustomerSection>
    </div>
  );
}