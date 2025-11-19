import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Users } from "lucide-react";

interface AssignPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: any;
  resourceType?: 'diet' | 'workout' | 'meal';
}

export function AssignPlanDialog({ open, onOpenChange, plan, resourceType = 'diet' }: AssignPlanDialogProps) {
  const { toast } = useToast();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const packageById = packages.reduce((map: Record<string, any>, pkg) => {
    map[String(pkg._id)] = pkg;
    return map;
  }, {});

  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(client => {
      const packageId = typeof client.packageId === 'object' ? String(client.packageId._id) : String(client.packageId);
      return {
        ...client,
        packageData: packageById[packageId] || null
      };
    });

  const assignMutation = useMutation({
    mutationFn: async (clientIds: string[]) => {
      if (!plan) return;
      
      const endpoint = resourceType === 'workout' 
        ? `/api/workout-plan-templates/${plan._id}/clone`
        : resourceType === 'meal'
        ? `/api/meals/${plan._id}/clone`
        : `/api/diet-plans/${plan._id}/clone`;
      
      const assignments = clientIds.map(clientId => 
        apiRequest('POST', endpoint, { clientId })
      );
      
      return Promise.all(assignments);
    },
    onSuccess: (_, clientIds) => {
      if (resourceType === 'workout') {
        queryClient.invalidateQueries({ queryKey: ['/api/workout-plan-templates'] });
      } else if (resourceType === 'meal') {
        // Meals create diet plans when assigned, so invalidate diet plan queries
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plans-with-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-assignments'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plans-with-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-templates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/diet-plan-assignments'] });
      }
      const resourceLabel = resourceType === 'workout' ? 'Workout' : resourceType === 'meal' ? 'Meal' : 'Diet';
      toast({
        title: "Success",
        description: `${resourceLabel} plan assigned to ${clientIds.length} client(s)`,
      });
      onOpenChange(false);
      setSelectedClients(new Set());
      setSearchQuery("");
    },
    onError: () => {
      const resourceLabel = resourceType === 'workout' ? 'workout' : resourceType === 'meal' ? 'meal' : 'diet';
      toast({
        title: "Error",
        description: `Failed to assign ${resourceLabel} plan`,
        variant: "destructive",
      });
    },
  });

  const handleToggleClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map(c => String(c._id))));
    }
  };

  const handleAssign = () => {
    if (selectedClients.size === 0) {
      toast({
        title: "No clients selected",
        description: "Please select at least one client",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate(Array.from(selectedClients));
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Assign {resourceType === 'workout' ? 'Workout' : resourceType === 'meal' ? 'Meal' : 'Diet'} Plan
          </DialogTitle>
          <DialogDescription>
            Assign "{plan.name}" to one or more clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-semibold mb-2">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {resourceType === 'workout' ? (
                <>
                  <div>
                    <span className="text-muted-foreground">Duration:</span> {plan.durationWeeks || 0} weeks
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span> {plan.difficulty || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span> {plan.category || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days:</span> {Object.keys(plan.exercises || {}).length} configured
                  </div>
                </>
              ) : resourceType === 'meal' ? (
                <>
                  <div>
                    <span className="text-muted-foreground">Calories:</span> {plan.calories || 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Meal Type:</span> {plan.mealType || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Protein:</span> {plan.protein || 0}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbs/Fats:</span> {plan.carbs || 0}g / {plan.fats || 0}g
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-muted-foreground">Calories:</span> {plan.targetCalories}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span> {plan.category || "Balanced"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Protein:</span> {plan.protein || 0}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbs/Fats:</span> {plan.carbs || 0}g / {plan.fats || 0}g
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-clients"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              data-testid="button-select-all"
            >
              {selectedClients.size === filteredClients.length ? "Deselect All" : "Select All"}
            </Button>
            <div className="text-sm text-muted-foreground">
              {selectedClients.size} of {filteredClients.length} selected
            </div>
          </div>

          <ScrollArea className="h-[400px] border rounded-md p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading clients...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No clients found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center space-x-3 p-3 rounded-md hover-elevate border cursor-pointer"
                    onClick={() => handleToggleClient(String(client._id))}
                    data-testid={`client-item-${client._id}`}
                  >
                    <Checkbox
                      checked={selectedClients.has(String(client._id))}
                      onCheckedChange={() => handleToggleClient(String(client._id))}
                      data-testid={`checkbox-client-${client._id}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{client.name}</span>
                        {client.packageData && (
                          <Badge variant="outline" className="text-xs">
                            {client.packageData.name}
                          </Badge>
                        )}
                      </div>
                      {client.email && (
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedClients(new Set());
                setSearchQuery("");
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || selectedClients.size === 0}
              data-testid="button-assign"
            >
              {assignMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign to {selectedClients.size} Client{selectedClients.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
