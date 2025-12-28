import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    History, RefreshCw, Filter, ChevronDown, ChevronUp,
    Plus, Edit2, Trash2, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuditLog {
    id: string;
    admin_email: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    table_name: string;
    record_id: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    created_at: string;
}

export const AuditLogViewer = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Filters
    const [tableFilter, setTableFilter] = useState<string>('all');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_recent_audit_logs', {
                p_limit: 100,
                p_offset: 0,
                p_table_filter: tableFilter === 'all' ? null : tableFilter,
                p_admin_filter: null
            });

            if (error) throw error;
            setLogs(data || []);
        } catch (err: any) {
            console.error('Error fetching audit logs:', err);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [tableFilter]);

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'INSERT': return <Plus className="w-4 h-4 text-green-600" />;
            case 'UPDATE': return <Edit2 className="w-4 h-4 text-blue-600" />;
            case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
            default: return null;
        }
    };

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'DELETE': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log => {
        if (actionFilter !== 'all' && log.action !== actionFilter) return false;
        if (searchTerm && !log.admin_email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const uniqueTables = [...new Set(logs.map(l => l.table_name))];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Audit Logs
                        </CardTitle>
                        <CardDescription>
                            Track all admin actions for security and accountability
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLogs}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Search by admin email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Select value={tableFilter} onValueChange={setTableFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by table" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tables</SelectItem>
                            {uniqueTables.map(table => (
                                <SelectItem key={table} value={table}>{table}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="INSERT">Insert</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Logs Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No audit logs found</p>
                        <p className="text-sm">Admin actions will appear here</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Admin</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead>Record ID</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <Collapsible key={log.id} asChild>
                                        <>
                                            <TableRow className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(log.id)}
                                                        >
                                                            {expandedRows.has(log.id)
                                                                ? <ChevronUp className="w-4 h-4" />
                                                                : <ChevronDown className="w-4 h-4" />
                                                            }
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">{log.admin_email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getActionBadgeColor(log.action)}>
                                                        <span className="flex items-center gap-1">
                                                            {getActionIcon(log.action)}
                                                            {log.action}
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {log.table_name}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {log.record_id?.slice(0, 8) || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(log.created_at)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                            <CollapsibleContent asChild>
                                                <TableRow className="bg-muted/30">
                                                    <TableCell colSpan={6} className="py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                                                            {log.old_values && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2 text-red-600">
                                                                        Previous Values
                                                                    </h4>
                                                                    <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-40">
                                                                        {JSON.stringify(log.old_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.new_values && (
                                                                <div>
                                                                    <h4 className="text-sm font-medium mb-2 text-green-600">
                                                                        New Values
                                                                    </h4>
                                                                    <pre className="text-xs bg-green-50 p-3 rounded overflow-auto max-h-40">
                                                                        {JSON.stringify(log.new_values, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </CollapsibleContent>
                                        </>
                                    </Collapsible>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AuditLogViewer;
