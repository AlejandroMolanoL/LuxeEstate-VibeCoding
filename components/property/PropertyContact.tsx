'use client';

import Image from 'next/image';

interface PropertyContactProps {
  price: string;
  address?: string;
  agentName?: string;
  agentImage?: string;
  propertyTitle: string;
  propertyId: string;
  dictionary?: any;
}

export default function PropertyContact({
  price,
  address,
  agentName = 'Sarah Jenkins',
  agentImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
  propertyTitle,
  propertyId,
  dictionary,
}: PropertyContactProps) {

  const handleWhatsApp = () => {
    const messageTemplate = dictionary?.contact_form?.whatsapp_message || 'Hola, me interesa la propiedad';
    const text = `${messageTemplate} ${propertyTitle} (Ref: ${propertyId})`;
    const encodedText = encodeURIComponent(text);
    // You would replace this with actual agent's number
    window.open(`https://wa.me/1234567890?text=${encodedText}`, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
      <div className="mb-4">
        <h1 className="text-4xl font-display font-light text-nordic mb-2">{price}</h1>
        {address && (
          <p className="text-nordic/60 font-medium flex items-center gap-1">
            <span className="material-icons text-mosque text-sm">location_on</span>
            {address}
          </p>
        )}
      </div>
      
      <div className="h-px bg-slate-100 my-6"></div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <Image
            src={agentImage}
            alt={agentName}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-nordic">{agentName}</h3>
          <div className="flex items-center gap-1 text-xs text-mosque font-medium">
            <span className="material-icons text-[14px]">star</span>
            <span>{dictionary?.contact_form?.top_rated_agent || "Top Rated Agent"}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors" title={dictionary?.contact_form?.chat || "Chat"}>
            <span className="material-icons text-sm">chat</span>
          </button>
          <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors" title={dictionary?.contact_form?.call || "Call"}>
            <span className="material-icons text-sm">call</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
          <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
          {dictionary?.contact_form?.schedule_tour || "Schedule Visit"}
        </button>
        <button 
          onClick={handleWhatsApp}
          className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <span className="material-icons text-xl text-green-500">chat</span>
          {dictionary?.contact_form?.whatsapp_agent || "WhatsApp Agent"}
        </button>
      </div>
    </div>
  );
}
