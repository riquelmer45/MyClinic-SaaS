import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <Button>
      <Link href="/authentication">
        <span>Logar</span>
      </Link>
    </Button>
  );
}
