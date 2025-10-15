import { useCallback, useEffect, useRef, useState } from 'react';
import { useAssets } from './useAssets';

// Accept both camelCase and snake_case as well as Candid optionals ([] | [v])
type MaybeOptional<T> = T | null | undefined | [T] | [];

type LogoSource = {
  // camelCase inputs (existing flow)
  logoType?: MaybeOptional<string>;
  logoAssetId?: MaybeOptional<string | number | bigint>;
  logoUrl?: MaybeOptional<string>;
  legacyLogo?: MaybeOptional<string>;
  // snake_case inputs (from registry/trending lists)
  logo_type?: MaybeOptional<string>;
  logo_asset_id?: MaybeOptional<string | number | bigint>;
  logo_url?: MaybeOptional<string>;
  legacy_logo?: MaybeOptional<string>;
};

type LogoImageState = {
  imageUrl: string;
  isObjectUrl: boolean;
};

// Helper to unwrap Candid optionals and normalize primitives
const unwrap = <T,>(v: MaybeOptional<T>): T | undefined => {
  if (Array.isArray(v)) {
    return (v.length ? (v[0] as T) : undefined);
  }
  return (v as any) ?? undefined;
};

const toStringOrUndefined = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : undefined;
  if (typeof v === 'string') return v.trim() === '' ? undefined : v;
  return undefined;
};

export const useLogoImage = (
  source: LogoSource
): { imageUrl: string; isObjectUrl: boolean; handleImageError: () => void } => {
  const { getAssetObjectUrl } = useAssets();
  const [state, setState] = useState<LogoImageState>({ imageUrl: '', isObjectUrl: false });
  const releaseRef = useRef<(() => void) | null>(null);
  // Prefer camelCase; fallback to snake_case; unwrap optionals
  const rawType = unwrap(source.logoType) ?? unwrap(source.logo_type);
  const normalizedType = (rawType ?? '').toString().toLowerCase();
  const rawAssetId = unwrap(source.logoAssetId) ?? unwrap(source.logo_asset_id);
  const normalizedAssetId = ((): string | undefined => {
    // Normalize to string; let useAssets handle actual BigInt conversion
    return toStringOrUndefined(rawAssetId);
  })();
  const rawUrl =
    unwrap(source.logoUrl) ??
    unwrap(source.logo_url) ??
    unwrap(source.legacyLogo) ??
    unwrap(source.legacy_logo);
  const normalizedUrl = toStringOrUndefined(rawUrl) ?? '';
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const applyImage = (nextUrl: string, isObjectUrl: boolean, release?: () => void) => {
      if (cancelled) {
        release?.();
        return;
      }
      if (releaseRef.current && releaseRef.current !== release) {
        releaseRef.current();
      }
      releaseRef.current = release ?? null;
      setState({ imageUrl: nextUrl, isObjectUrl });
    };

    const resolve = async () => {
      // Treat as upload when explicitly set, or when assetId exists and no URL provided
      const shouldLoadUpload =
        normalizedType === 'upload' || (!!normalizedAssetId && !normalizedUrl);

      if (shouldLoadUpload && normalizedAssetId) {
        try {
          const result = await getAssetObjectUrl(normalizedAssetId);
          applyImage(result.url, true, result.release);
          return;
        } catch (error) {
          console.warn('useLogoImage: failed to load uploaded logo asset', error);
          // Fallback: try HTTP gateway URL (works even if actor not ready)
          try {
            const assetsCanisterId = (import.meta as any)?.env?.VITE_CANISTER_ID_ASSETS;
            if (assetsCanisterId) {
              // Prefer local replica gateway in dev; window.location is fine to build absolute URL
              const localGateway = 'http://127.0.0.1:4943';
              const base = localGateway; // keep simple and predictable for dev
              const httpUrl = `${base}/?canisterId=${assetsCanisterId}&file=${encodeURIComponent(
                normalizedAssetId
              )}`;
              applyImage(httpUrl, false);
              return;
            }
          } catch {
            // ignore and proceed to URL fallback below
          }
        }
      }

      const fallbackUrl = normalizedType === 'url' ? normalizedUrl : (normalizedUrl || '');

      applyImage(fallbackUrl ?? '', false);
    };

    resolve();

    return () => {
      cancelled = true;
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }
    };
  }, [
    normalizedType,
    normalizedAssetId,
    normalizedUrl,
    getAssetObjectUrl,
    reloadKey,
  ]);

  const handleImageError = useCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
    setState({ imageUrl: '', isObjectUrl: false });
    setReloadKey((prev) => prev + 1);
  }, []);

  return {
    imageUrl: state.imageUrl,
    isObjectUrl: state.isObjectUrl,
    handleImageError,
  };
};
