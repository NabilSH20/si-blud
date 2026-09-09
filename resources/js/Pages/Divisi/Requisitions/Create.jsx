import DivisiLayout from '@/Layouts/DivisiLayout';
import RequisitionFormModal from './Partials/RequisitionFormModal';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({
    auth,
    rbaAccounts = [],
    items = [],
    userDivision,
    userUnit,
    initialJenis = 'Operasi',
    subKegiatanOptions = [],
    defaultFiscalYear = 2027,
}) {
    const [showModal, setShowModal] = useState(true);

    const handleClose = () => {
        setShowModal(false);
        router.visit(route('requisitions.index'));
    };

    return (
        <DivisiLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Formulir Usulan Belanja E-BLUD
                </h2>
            }
        >
            <Head title="Buat Usulan Belanja" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <RequisitionFormModal
                        show={showModal}
                        onClose={handleClose}
                        initialJenis={initialJenis}
                        rbaAccounts={rbaAccounts}
                        items={items}
                        subKegiatanOptions={subKegiatanOptions}
                        userDivision={userDivision}
                        userUnit={userUnit}
                        defaultFiscalYear={defaultFiscalYear}
                    />
                </div>
            </div>
        </DivisiLayout>
    );
}

