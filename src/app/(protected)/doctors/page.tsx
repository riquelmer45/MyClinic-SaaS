import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageContainer,
  PageDescription,
  PageHeader,
  PageHearderContent,
  PageTitle,
} from "@/components/ui/page-container";

const DoctorsPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHearderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>Gerencie os médicos da sua clínica.</PageDescription>
        </PageHearderContent>
        <PageActions>
          <Button>
            <Plus />
            Adicionar um médico
          </Button>
        </PageActions>
      </PageHeader>
    </PageContainer>
  );
};

export default DoctorsPage;
