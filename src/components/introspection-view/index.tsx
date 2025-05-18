import { useState } from 'react';
import {
	ChevronLeft,
	Code,
	FileText,
	LayoutGrid,
	LayoutList,
} from 'lucide-react';
import { ProcedureList } from './procedure-list';
import { SchemaView } from './schema-view';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { IntrospectionData } from '@/types/trpc';
import { useSettings } from '@/hooks/use-settings';

interface IntrospectionViewProps {
	data: IntrospectionData | null;
	isLoading: boolean;
	error: string | null;
}

export function IntrospectionView({
	data,
	isLoading,
	error,
}: IntrospectionViewProps) {
	const { settings, updateIntrospectionSettings } = useSettings();
	const [selectedProcedure, setSelectedProcedure] = useState<
		IntrospectionData['procedures'][0] | null
	>(null);

	const handleProcedureClick = (
		procedure: IntrospectionData['procedures'][0],
	) => {
		setSelectedProcedure(procedure);
		updateIntrospectionSettings({ viewMode: 'detail' });
	};

	const handleBack = () => {
		setSelectedProcedure(null);
		updateIntrospectionSettings({ viewMode: 'list' });
	};

	if (isLoading) {
		return (
			<div className="p-4 text-sm text-muted-foreground text-center">
				Loading introspection data...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-sm text-red-500 text-center">{error}</div>
		);
	}

	if (!data) {
		return (
			<div className="p-4 text-sm text-muted-foreground text-center">
				No introspection data available
			</div>
		);
	}

	if (settings.introspection.viewMode === 'detail' && selectedProcedure) {
		return (
			<div className="h-full flex flex-col">
				<CardHeader className="flex-none p-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleBack}
								className="h-8 w-8"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div>
								<h2 className="text-sm font-semibold">
									{selectedProcedure.path}
								</h2>
								<p className="text-sm text-muted-foreground">
									{selectedProcedure.type.toUpperCase()}{' '}
									Procedure
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{settings.introspection.schemaViewMode ===
								'parsed' && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										updateIntrospectionSettings({
											layoutMode:
												settings.introspection
													.layoutMode === 'horizontal'
													? 'vertical'
													: 'horizontal',
										})
									}
									className="h-8 w-8"
								>
									{settings.introspection.layoutMode ===
									'horizontal' ? (
										<LayoutGrid className="h-4 w-4" />
									) : (
										<LayoutList className="h-4 w-4" />
									)}
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								onClick={() =>
									updateIntrospectionSettings({
										schemaViewMode:
											settings.introspection
												.schemaViewMode === 'raw'
												? 'parsed'
												: 'raw',
									})
								}
								className="h-8 w-8"
							>
								{settings.introspection.schemaViewMode ===
								'raw' ? (
									<Code className="h-4 w-4" />
								) : (
									<FileText className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="flex-1 p-0 min-h-0">
					{settings.introspection.schemaViewMode === 'raw' ? (
						<SchemaView schema={selectedProcedure} viewMode="raw" />
					) : (
						<div
							className={`h-full ${settings.introspection.layoutMode === 'horizontal' ? 'grid grid-cols-2 divide-x' : 'flex flex-col divide-y'}`}
						>
							<div
								className={`h-full flex flex-col ${settings.introspection.layoutMode === 'vertical' ? 'flex-1' : ''}`}
							>
								<div className="flex-none border-b bg-muted/30 py-2 px-4">
									<h3 className="text-sm font-medium">
										Input Schema
									</h3>
								</div>
								<div className="flex-1 min-h-0">
									<SchemaView
										schema={selectedProcedure.inputSchema}
										viewMode="parsed"
									/>
								</div>
							</div>
							<div
								className={`h-full flex flex-col ${settings.introspection.layoutMode === 'vertical' ? 'flex-1' : ''}`}
							>
								<div className="flex-none border-b bg-muted/30 py-2 px-4">
									<h3 className="text-sm font-medium">
										Output Schema
									</h3>
								</div>
								<div className="flex-1 min-h-0">
									<SchemaView
										schema={selectedProcedure.outputSchema}
										viewMode="parsed"
									/>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</div>
		);
	}

	return (
		<ProcedureList
			data={data}
			selectedType={settings.introspection.selectedType}
			setSelectedType={(type) =>
				updateIntrospectionSettings({ selectedType: type })
			}
			onProcedureClick={handleProcedureClick}
		/>
	);
}
