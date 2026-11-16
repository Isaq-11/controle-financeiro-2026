export function PageHeader({ title, subtitle, actions, children }) {
    return (
        <header className="page-header">
            <div>
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__sub">{subtitle}</p>}
                {children}
            </div>
            {actions && <div className="page-header__actions">{actions}</div>}
        </header>
    );
}
