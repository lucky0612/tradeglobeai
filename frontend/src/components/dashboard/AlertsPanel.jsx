import React from 'react';
import { Card } from '../common/Card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const getAlertIcon = (severity) => {
    switch (severity) {
        case 'critical':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'high':
            return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        case 'medium':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        default:
            return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
};

const getAlertColor = (severity) => {
    switch (severity) {
        case 'critical':
            return 'bg-red-50 text-red-800 border-red-200';
        case 'high':
            return 'bg-orange-50 text-orange-800 border-orange-200';
        case 'medium':
            return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        default:
            return 'bg-green-50 text-green-800 border-green-200';
    }
};

const AlertsPanel = ({ alerts }) => {
    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                <div className="mt-4 space-y-4">
                    {alerts?.map((alert, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${getAlertColor(
                                alert.severity
                            )}`}
                        >
                            <div className="flex items-center">
                                {getAlertIcon(alert.severity)}
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">{alert.message}</h3>
                                    {alert.details && (
                                        <p className="mt-1 text-sm opacity-75">
                                            {alert.details}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {alert.actions && (
                                <div className="mt-3 flex space-x-3">
                                    {alert.actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={action.onClick}
                                            className="text-sm font-medium underline hover:opacity-75"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {alerts?.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                            No active alerts
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AlertsPanel;