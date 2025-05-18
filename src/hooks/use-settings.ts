import { useState, useEffect } from 'react';

export interface EditorSettings {
	fontSize: number;
	theme: 'light' | 'dark' | 'system';
}

export interface IntrospectionSettings {
	viewMode: 'list' | 'detail';
	schemaViewMode: 'raw' | 'parsed';
	layoutMode: 'horizontal' | 'vertical';
	selectedType: 'query' | 'mutation' | 'subscription' | 'all';
}

export interface Settings {
	editor: EditorSettings;
	introspection: IntrospectionSettings;
}

const DEFAULT_SETTINGS: Settings = {
	editor: {
		fontSize: 14,
		theme: 'system',
	},
	introspection: {
		viewMode: 'list',
		schemaViewMode: 'parsed',
		layoutMode: 'horizontal',
		selectedType: 'all',
	},
};

const STORAGE_KEY = 'trpc-playground-settings';

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(() => {
		if (typeof window === 'undefined') return DEFAULT_SETTINGS;

		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return DEFAULT_SETTINGS;

		try {
			return {
				...DEFAULT_SETTINGS,
				...JSON.parse(stored),
			};
		} catch {
			return DEFAULT_SETTINGS;
		}
	});

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}, [settings]);

	const updateEditorSettings = (updates: Partial<EditorSettings>) => {
		setSettings((prev) => ({
			...prev,
			editor: {
				...prev.editor,
				...updates,
			},
		}));
	};

	const updateIntrospectionSettings = (
		updates: Partial<IntrospectionSettings>,
	) => {
		setSettings((prev) => ({
			...prev,
			introspection: {
				...prev.introspection,
				...updates,
			},
		}));
	};

	const resetSettings = () => {
		setSettings(DEFAULT_SETTINGS);
	};

	return {
		settings,
		updateEditorSettings,
		updateIntrospectionSettings,
		resetSettings,
	};
}
