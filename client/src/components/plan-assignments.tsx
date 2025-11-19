import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Dumbbell, UtensilsCrossed, Mail } from "lucide-react";

export function PlanAssignments() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/diet-plan-assignments'],
  });

  const filteredAssignments = assignments.filter((assignment) => {
    const query = searchQuery.toLowerCase();
    return (
      assignment.clientName?.toLowerCase().includes(query) ||
      assignment.clientEmail?.toLowerCase().includes(query) ||
      assignment.dietPlanName?.toLowerCase().includes(query) ||
      assignment.workoutPlanName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client, email, or plan name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-assignments"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredAssignments.length} {filteredAssignments.length === 1 ? 'Assignment' : 'Assignments'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-semibold">No assignments found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try adjusting your search criteria' : 'Assign plans to clients to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id} data-testid={`card-assignment-${assignment._id}`} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" data-testid={`text-client-name-${assignment._id}`}>
                      {assignment.clientName}
                    </h3>
                    {assignment.clientEmail && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{assignment.clientEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs">Diet Plan:</span>
                  </div>
                  {assignment.dietPlanName ? (
                    <Badge variant="default" className="w-full justify-center">
                      {assignment.dietPlanName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center text-muted-foreground">
                      Not Assigned
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs">Workout Plan:</span>
                  </div>
                  {assignment.workoutPlanName ? (
                    <Badge variant="default" className="w-full justify-center">
                      {assignment.workoutPlanName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center text-muted-foreground">
                      Not Assigned
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
