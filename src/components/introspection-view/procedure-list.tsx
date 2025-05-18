import { ChevronRight } from 'lucide-react';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntrospectionData } from '@/types/trpc';

interface ProcedureListProps {
	data: IntrospectionData;
	selectedType: 'query' | 'mutation' | 'subscription' | 'all';
	setSelectedType: (
		type: 'query' | 'mutation' | 'subscription' | 'all',
	) => void;
	onProcedureClick: (procedure: IntrospectionData['procedures'][0]) => void;
}

export function ProcedureList({
	data,
	selectedType,
	setSelectedType,
	onProcedureClick,
}: ProcedureListProps) {
	const filteredProcedures = data.procedures.filter((p) =>
		selectedType === 'all' ? true : p.type === selectedType,
	);

	return (
		<div className="h-full flex flex-col">
			<CardHeader className="flex-none border-b bg-muted/30 py-2">
				<div className="flex items-center gap-2">
					<Button
						variant={selectedType === 'all' ? 'default' : 'ghost'}
						size="sm"
						className="h-7"
						onClick={() => setSelectedType('all')}
					>
						All
					</Button>
					<Button
						variant={selectedType === 'query' ? 'default' : 'ghost'}
						size="sm"
						className="h-7"
						onClick={() => setSelectedType('query')}
					>
						Queries
					</Button>
					<Button
						variant={
							selectedType === 'mutation' ? 'default' : 'ghost'
						}
						size="sm"
						className="h-7"
						onClick={() => setSelectedType('mutation')}
					>
						Mutations
					</Button>
					<Button
						variant={
							selectedType === 'subscription'
								? 'default'
								: 'ghost'
						}
						size="sm"
						className="h-7"
						onClick={() => setSelectedType('subscription')}
					>
						Subscriptions
					</Button>
				</div>
			</CardHeader>
			<CardContent className="flex-1 p-0 min-h-0 overflow-auto">
				<div className="divide-y divide-border">
					{filteredProcedures.map((procedure, index) => (
						<div
							key={index}
							className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
							onClick={() => onProcedureClick(procedure)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">
										{procedure.path}
									</span>
									<span
										className={`px-2 py-0.5 rounded text-xs ${
											procedure.type === 'query'
												? 'bg-blue-500/10 text-blue-500'
												: procedure.type === 'mutation'
													? 'bg-purple-500/10 text-purple-500'
													: 'bg-green-500/10 text-green-500'
										}`}
									>
										{procedure.type}
									</span>
								</div>
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
							</div>
						</div>
					))}
					{filteredProcedures.length === 0 && (
						<div className="p-3 text-sm text-muted-foreground text-center">
							No procedures found
						</div>
					)}
				</div>
			</CardContent>
		</div>
	);
}
