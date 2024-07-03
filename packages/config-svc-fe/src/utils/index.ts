export const convertMillisecondsToDHMS = (milliseconds: number) => {
    // Calculate total seconds
    const totalSeconds = Math.floor(milliseconds / 1000);

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds
    };
};

export function changeToEpoch(days: number, hours: number, minutes: number, seconds: number) {
	// Calculate the total number of seconds
	var totalSeconds = ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds) * 1000;

	// Return the epoch time in seconds
	return totalSeconds;
}

export const sortAlphabetically = (array: any[], key: string) => {
	return array.sort((a, b) => {
		if (a[key] < b[key]) {
			return -1;
		}
		if (a[key] > b[key]) {
			return 1;
		}
		return 0;
	});
};

interface Version {
	major: number;
	minor: number;
	patch: number;
}

/**
 * Increment the version based on the change type.
 * @param version - The current version string.
 * @param changeType - The type of change ('major', 'minor', 'patch').
 * @param existingVersions - List of existing versions to avoid collisions.
 * @returns The new version string.
 */
export const incrementVersion = (selectedVersion: string, changeType: string, versions: string[]): string => {
	// Parse version string into an object with major, minor, and patch numbers
	const parseVersion = (version: string): Version => {
		const [major, minor, patch] = version.split('.').map(Number);
		return { major, minor, patch };
	};

	// Format the version object back into a version string
	const formatVersion = ({ major, minor, patch }: Version): string => {
		return `${major}.${minor}.${patch}`;
	};

	const parsedVersions = versions.map(parseVersion);
	const selectedParsedVersion = parseVersion(selectedVersion);

	// Get the highest version for a specific major or minor version
	const getHighestForType = (major: number, minor?: number): Version => {
		return parsedVersions.reduce((highest, current) => {
			if (changeType === 'major' && current.major > highest.major) {
				return current;
			}
			if (changeType === 'minor' && current.major === major && current.minor > highest.minor) {
				return current;
			}
			if (changeType === 'patch' && current.major === major && current.minor === minor && current.patch > highest.patch) {
				return current;
			}
			return highest;
		}, parseVersion('0.0.0'));
	};

	// Increment the version based on the change type and ensure it does not exist
	let newVersion: Version = { major: 0, minor: 0, patch: 0 }

	switch (changeType) {
		case 'major':
			let highestMajorVersion = getHighestForType(0).major;
			do {
				newVersion = { major: ++highestMajorVersion, minor: 0, patch: 0 };
			} while (versions.includes(formatVersion(newVersion)));
			break;
		case 'minor':
			let highestMinorVersion = getHighestForType(selectedParsedVersion.major).minor;
			do {
				newVersion = { major: selectedParsedVersion.major, minor: ++highestMinorVersion, patch: 0 };
			} while (versions.includes(formatVersion(newVersion)));
			break;
		case 'patch':
			let highestPatchVersion = getHighestForType(selectedParsedVersion.major, selectedParsedVersion.minor).patch;
			do {
				newVersion = { major: selectedParsedVersion.major, minor: selectedParsedVersion.minor, patch: ++highestPatchVersion };
			} while (versions.includes(formatVersion(newVersion)));
			break;
		default:
			break;
	}

	return formatVersion(newVersion);
}