export class Collection<K, V> extends Map<K, V> {
	sort(key?: (i: V) => any, reverse = false) {
		let sorted = new Collection<K, V>()

		if (!key) {
			// Sort by key
			for (const k of [...this.keys()].sort()) {
				sorted.set(k, this.get(k))
			}
		} else {
			// Sort by value
			for (const k of [...this.keys()].sort((a, b) => key(this.get(a)) - key(this.get(b)))) {
				sorted.set(k, this.get(k))
			}
		}

		if (reverse) {
			sorted = sorted.reverse()
		}

		return sorted
	}

	copy() {
		return Collection.fromMap(this)
	}

	reverse() {
		const copy = this.copy()
		const reversed = new Collection<K, V>()

		for (const k of [...copy.keys()].reverse()) {
			reversed.set(k, copy.get(k))
		}

		return reversed
	}

	getDefault(key: K, defaultValue: unknown) {
		return super.get(key) ?? defaultValue
	}

	static fromArray<T extends Array<T>>(arr: T[][]): Collection<T, T[]> {
		const collection = new Collection<T, T[]>()

		for (const i of arr) {
			for (const [key, value] of i) {
				collection.set(key, value)
			}
		}

		return collection
	}

	static fromObject<T extends Record<string, any>>(obj: T): Collection<keyof T, T[keyof T]> {
		const collection = new Collection<keyof T, T[keyof T]>()

		for (const [key, value] of Object.entries(obj)) {
			collection.set(key as keyof T, value)
		}

		return collection
	}

	static fromMap<K, V>(map: Map<K, V>): Collection<K, V> {
		const collection = new Collection<K, V>()

		for (const [key, value] of map) {
			collection.set(key, value)
		}

		return collection
	}

	toArray() {
		return [...this]
	}

	toObject() {
		const obj: Record<string, any> = {}

		for (const [key, value] of this) {
			obj[key as string] = value
		}

		return obj
	}

	toMap() {
		return new Map(this)
	}
}
