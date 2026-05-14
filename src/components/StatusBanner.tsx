import { useAppStore } from '../store/useStore';

export default function StatusBanner() {
  const { settings } = useAppStore();

  return (
    <div className={`status-banner ${!settings.is_open ? 'closed' : ''}`}>
      <div className="status-banner-track">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="status-banner-text">
            <span className="status-dot" />
            <span>
              {settings.is_open ? settings.announcement : 'We are currently closed. Check back soon!'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
